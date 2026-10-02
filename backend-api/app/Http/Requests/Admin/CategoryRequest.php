<?php

namespace App\Http\Requests\Admin;

use App\Rules\SafeText;
use App\Services\CategoryImageService;
use App\Support\CategoryIcons;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

/**
 * Sent as multipart/form-data so it can carry the image file. Updates use
 * POST with `_method=PUT`.
 */
class CategoryRequest extends FormRequest
{
    public const IMAGE_MAX_KB = 2048;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name' => [$required, 'string', 'min:2', 'max:100', new SafeText],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash:ascii', Rule::unique('categories', 'slug')->ignore($this->route('category'))],
            'description' => ['nullable', 'string', 'max:1000', new SafeText],
            'icon' => ['nullable', 'string', Rule::in(CategoryIcons::names())],
            'image' => [
                'nullable',
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max(self::IMAGE_MAX_KB)
                    ->dimensions(Rule::dimensions()
                        ->minWidth(CategoryImageService::WIDTH)
                        ->minHeight(CategoryImageService::HEIGHT)
                        ->maxWidth(CategoryImageService::WIDTH * 4)
                        ->maxHeight(CategoryImageService::HEIGHT * 4)
                        ->ratio(4 / 3)),
            ],
            'remove_image' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'icon.in' => 'Please choose an icon from the library.',
            'image.dimensions' => sprintf(
                'The image must be 4:3 landscape, at least %d × %d px and at most %d × %d px.',
                CategoryImageService::WIDTH, CategoryImageService::HEIGHT, CategoryImageService::WIDTH * 4, CategoryImageService::HEIGHT * 4,
            ),
        ];
    }
}
