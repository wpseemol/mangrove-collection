<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\NewsletterSubscriberResource;
use App\Models\NewsletterSubscriber;
use App\Rules\SafeText;
use App\Support\Search;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class NewsletterSubscriberController extends Controller
{
    private const STATUSES = ['subscribed', 'unsubscribed'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $subscribers = $this->filtered($request)
            ->latest()
            ->orderByDesc('id')
            ->paginate((int) $request->query('per_page', 20))
            ->withQueryString();

        $counts = NewsletterSubscriber::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return NewsletterSubscriberResource::collection($subscribers)->additional([
            'counts' => collect(self::STATUSES)->mapWithKeys(fn (string $status) => [$status => (int) ($counts[$status] ?? 0)]),
        ]);
    }

    public function export(Request $request): Response
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100', new SafeText],
            'status' => ['nullable', Rule::in(self::STATUSES)],
        ]);

        $rows = [['email', 'status', 'source', 'subscribed_at', 'unsubscribed_at']];

        foreach ($this->filtered($request)->latest()->orderByDesc('id')->get() as $subscriber) {
            $rows[] = [
                $subscriber->email,
                $subscriber->status,
                $subscriber->source,
                $subscriber->created_at?->utc()->format('Y-m-d\TH:i:s.v\Z'),
                $subscriber->unsubscribed_at?->utc()->format('Y-m-d\TH:i:s.v\Z'),
            ];
        }

        $csv = "\u{FEFF}".implode("\r\n", array_map(fn (array $row) => implode(',', array_map($this->csvCell(...), $row)), $rows))."\r\n";

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="newsletter-subscribers-'.now()->toDateString().'.csv"',
        ]);
    }

    public function update(Request $request, NewsletterSubscriber $subscriber): NewsletterSubscriberResource
    {
        $data = $request->validate(['status' => ['required', Rule::in(self::STATUSES)]]);

        $subscriber->update([
            'status' => $data['status'],
            'unsubscribed_at' => $data['status'] === 'unsubscribed' ? ($subscriber->unsubscribed_at ?? now()) : null,
        ]);

        return new NewsletterSubscriberResource($subscriber);
    }

    public function destroy(NewsletterSubscriber $subscriber): JsonResponse
    {
        $subscriber->delete();

        return response()->json(null, 204);
    }

    /** @return Builder<NewsletterSubscriber> */
    private function filtered(Request $request): Builder
    {
        return NewsletterSubscriber::query()
            ->when($request->query('q'), fn (Builder $q, $term) => $q->where('email', 'like', Search::like($term)))
            ->when($request->query('status'), fn (Builder $q, $status) => $q->where('status', $status));
    }

    /** Spreadsheet-safe CSV: cells that start with a formula character are prefixed so Excel shows them as text. */
    private function csvCell(?string $value): string
    {
        $text = $value ?? '';
        $safe = preg_match('/^[=+\-@\t\r]/', $text) === 1 ? "'{$text}" : $text;

        return preg_match('/[",\r\n]/', $safe) === 1 ? '"'.str_replace('"', '""', $safe).'"' : $safe;
    }
}
