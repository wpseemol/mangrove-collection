<?php

namespace App\Http\Requests;

use App\Rules\SafeText;
use App\Services\ReviewImageService;
use App\Services\ReviewService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

/** Writing or editing a review (multipart: photos are optional). */
class ReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'min:10', 'max:1000', new SafeText],
            'images' => ['nullable', 'array', 'max:'.ReviewService::MAX_IMAGES],
            'images.*' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:min_width=200,min_height=200,max_width=4096,max_height=4096'],
            'keep_images' => ['nullable', 'array', 'max:'.ReviewService::MAX_IMAGES],
            'keep_images.*' => ['string', 'max:255', function (string $attribute, mixed $value, \Closure $fail) {
                if (! ReviewImageService::isOwnPath($value)) {
                    $fail('One of the kept photos is invalid.');
                }
            }],
        ];
    }

    public function attributes(): array
    {
        return [
            'images.*' => 'photo',
            'comment' => 'review',
        ];
    }

    public function messages(): array
    {
        return [
            'images.*.dimensions' => 'Each photo must be between 200 and 4096 pixels wide and tall.',
            'images.*.max' => 'Each photo must be 5 MB or smaller.',
            'images.max' => 'You can add up to '.ReviewService::MAX_IMAGES.' photos.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('comment'))) {
            $this->merge(['comment' => trim(preg_replace("/\n{3,}/", "\n\n", str_replace("\r\n", "\n", $this->input('comment'))))]);
        }
    }

    /**
     * @return array{rating: int, comment: string}
     */
    public function reviewData(): array
    {
        return ['rating' => $this->integer('rating'), 'comment' => $this->string('comment')->toString()];
    }

    /**
     * @return list<UploadedFile>
     */
    public function newImages(): array
    {
        return array_values($this->file('images', []));
    }

    /**
     * @return list<string>
     */
    public function keptImages(): array
    {
        return array_values(array_filter((array) $this->input('keep_images', []), 'is_string'));
    }
}
