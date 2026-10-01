<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $product = $this->route('product');
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'category_id' => [$required, 'integer', 'exists:categories,id'],
            'name' => [$required, 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('products', 'slug')->ignore($product)],
            'unit' => ['nullable', 'string', 'max:50'],
            'size' => ['nullable', 'string', 'max:100'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:2048'],
            'tags' => ['nullable', 'array', 'max:30'],
            'tags.*' => ['string', 'max:50'],
            'status' => ['sometimes', Rule::enum(ProductStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],

            'images' => ['sometimes', 'array', 'max:20'],
            'images.*.url' => ['required', 'string', 'max:2048'],
            'images.*.alt' => ['nullable', 'string', 'max:255'],

            'variants' => [$required, 'array', 'min:1', 'max:50'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.title' => ['required', 'string', 'max:255'],
            'variants.*.type' => ['nullable', 'string', 'max:50'],
            'variants.*.sku' => ['nullable', 'string', 'max:100', 'distinct'],
            'variants.*.price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'variants.*.compare_price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.is_default' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $product = $this->route('product');

                foreach ((array) $this->input('variants') as $index => $variant) {
                    if (blank($variant['sku'] ?? null)) {
                        continue;
                    }

                    $taken = ProductVariant::query()
                        ->where('sku', $variant['sku'])
                        ->when($product instanceof Product, fn ($q) => $q->where('product_id', '!=', $product->id))
                        ->exists();

                    if ($taken) {
                        $validator->errors()->add("variants.{$index}.sku", 'This SKU is already used by another product.');
                    }
                }
            },
        ];
    }
}
