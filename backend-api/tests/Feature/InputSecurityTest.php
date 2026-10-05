<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use App\Rules\SafeHtml;
use App\Rules\SafeText;
use App\Rules\SafeUrl;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InputSecurityTest extends TestCase
{
    use RefreshDatabase;

    public static function unsafeText(): array
    {
        return [
            'script tag' => ['<script>alert(1)</script>'],
            'img onerror' => ['<img src=x onerror=alert(1)>'],
            'php open tag' => ['<?php echo 1;'],
            'php close tag' => ['name ?>'],
            'html comment' => ['<!-- hi -->'],
            'javascript url' => ['javascript:alert(1)'],
            'or 1=1' => ["admin' OR 1=1"],
            'comment out' => ["admin'--"],
            'union select' => ['1 UNION ALL SELECT email FROM users'],
            'stacked drop' => ['x; DROP TABLE users'],
            'sleep' => ['1 AND sleep(5)'],
            'null byte' => ["abc\0def"],
        ];
    }

    #[DataProvider('unsafeText')]
    public function test_safe_text_rejects_payloads(string $payload): void
    {
        $this->assertTrue(SafeText::isUnsafe($payload));
    }

    public function test_safe_text_allows_normal_writing(): void
    {
        foreach ([
            'Sundarban honey 500g — pure & raw',
            "Rahim's shop, Road #4, Khulna-9100",
            'Price < 500 tk? Ask us: 01712-345678',
            'Select the size you want and update the cart',
            "Line one\nLine two",
            'মধু ও মাছ',
        ] as $text) {
            $this->assertFalse(SafeText::isUnsafe($text), $text);
        }
    }

    public function test_safe_html_allows_formatting_but_not_scripts(): void
    {
        $this->assertTrue(SafeHtml::isSafe('<p>Fresh <strong>hilsa</strong></p><ul><li>1 kg</li></ul><a href="https://example.com" target="_blank" rel="noopener">More</a>'));

        foreach ([
            '<script>alert(1)</script>',
            '<p onclick="alert(1)">x</p>',
            '<a href="javascript:alert(1)">x</a>',
            '<iframe src="https://evil.test"></iframe>',
            '<p style="background:url(x)">x</p>',
            '<?php echo 1; ?>',
            '<img src=x onerror=alert(1)>',
            '<p>unclosed <script',
        ] as $html) {
            $this->assertFalse(SafeHtml::isSafe($html), $html);
        }
    }

    public function test_safe_url(): void
    {
        $this->assertTrue(SafeUrl::isSafe('https://cdn.example.com/a.jpg'));
        $this->assertTrue(SafeUrl::isSafe('/shop?category=honey', allowRelative: true));
        $this->assertFalse(SafeUrl::isSafe('/shop', allowRelative: false));
        $this->assertFalse(SafeUrl::isSafe('javascript:alert(1)', allowRelative: true));
        $this->assertFalse(SafeUrl::isSafe('//evil.test/x', allowRelative: true));
        $this->assertFalse(SafeUrl::isSafe('https://x.test/"onmouseover="alert(1)'));
    }

    public function test_storefront_forms_reject_markup(): void
    {
        $this->postJson('/v1/auth/register', [
            'name' => '<b>Hacker</b>',
            'email' => 'hacker@example.com',
            'phone' => "01712345678' OR '1'='1",
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'phone']);

        $this->getJson('/v1/products?q='.urlencode("' UNION SELECT password FROM users--"))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('q');

        $this->getJson('/v1/orders/track?order_number='.urlencode("MC-1' OR 1=1--").'&phone=01712345678')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('order_number');
    }

    public function test_admin_product_description_only_accepts_basic_html(): void
    {
        Sanctum::actingAs(User::factory()->manager()->create());
        $category = Category::factory()->create();

        $payload = fn (string $description) => [
            'category_id' => $category->id,
            'name' => 'Honey',
            'description' => $description,
            'variants' => [['title' => '500g', 'price' => 600]],
        ];

        $this->postJson('/v1/admin/products', $payload('<p>Pure <em>raw</em> honey</p>'))->assertCreated();
        $this->postJson('/v1/admin/products', $payload('<p>Hi</p><script>steal()</script>'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('description');
    }

    public function test_api_responses_carry_security_headers(): void
    {
        $this->getJson('/v1/categories')
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'no-referrer');
    }

    public function test_uploads_are_rate_limited(): void
    {
        Sanctum::actingAs(User::factory()->manager()->create());

        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/v1/admin/categories', ['name' => ''])->assertUnprocessable();
        }

        $this->postJson('/v1/admin/categories', ['name' => ''])->assertTooManyRequests();
    }
}
