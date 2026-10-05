<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryImageAndIconTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('uploads');
        Sanctum::actingAs(User::factory()->manager()->create());
    }

    public function test_icon_library_has_between_300_and_350_renderable_icons(): void
    {
        $icons = $this->getJson('/v1/category-icons')
            ->assertOk()
            ->assertHeader('Cache-Control')
            ->json('data');

        $this->assertGreaterThanOrEqual(300, count($icons));
        $this->assertLessThanOrEqual(350, count($icons));
        $this->assertContains('fish', array_column($icons, 'name'));

        foreach ($icons as $icon) {
            $this->assertNotEmpty($icon['nodes']);
            foreach ($icon['nodes'] as [$tag]) {
                $this->assertContains($tag, ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);
            }
        }
    }

    public function test_category_image_is_stored_in_uploads_category_named_after_the_category(): void
    {
        $response = $this->post('/v1/admin/categories', [
            'name' => 'Sundarban Honey',
            'icon' => 'hexagon',
            'image' => UploadedFile::fake()->image('anything.png', 1200, 900),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.icon', 'hexagon')
            ->assertJsonStructure(['data' => ['icon_nodes']]);

        $path = Category::query()->sole()->image;

        $this->assertMatchesRegularExpression('#^category/sundarban-honey-[a-z0-9]{8}\.webp$#', $path);
        Storage::disk('uploads')->assertExists($path);
        $this->assertStringEndsWith('/'.$path, $response->json('data.image'));

        [$width, $height] = getimagesizefromstring(Storage::disk('uploads')->get($path));
        $this->assertSame([800, 600], [$width, $height]);
    }

    public function test_image_must_match_the_required_dimensions(): void
    {
        $this->post('/v1/admin/categories', [
            'name' => 'Fish',
            'image' => UploadedFile::fake()->image('small.jpg', 400, 300),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('image');

        $this->post('/v1/admin/categories', [
            'name' => 'Fish',
            'image' => UploadedFile::fake()->image('square.jpg', 1000, 1000),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('image');

        $this->post('/v1/admin/categories', [
            'name' => 'Fish',
            'image' => UploadedFile::fake()->create('shell.php', 10, 'image/jpeg'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('image');

        Storage::disk('uploads')->assertDirectoryEmpty('category');
    }

    public function test_unknown_icons_are_rejected(): void
    {
        $this->postJson('/v1/admin/categories', ['name' => 'Fish', 'icon' => '"><script>'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('icon');
    }

    public function test_replacing_or_removing_the_image_deletes_the_old_file(): void
    {
        $this->post('/v1/admin/categories', [
            'name' => 'Crab',
            'image' => UploadedFile::fake()->image('a.jpg', 800, 600),
        ], ['Accept' => 'application/json'])->assertCreated();

        $category = Category::query()->sole();
        $first = $category->image;

        $this->post("/v1/admin/categories/{$category->id}", [
            '_method' => 'PUT',
            'image' => UploadedFile::fake()->image('b.jpg', 1600, 1200),
        ], ['Accept' => 'application/json'])->assertOk();

        $second = $category->fresh()->image;
        $this->assertNotSame($first, $second);
        Storage::disk('uploads')->assertMissing($first);
        Storage::disk('uploads')->assertExists($second);

        $this->post("/v1/admin/categories/{$category->id}", ['_method' => 'PUT', 'remove_image' => '1'], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.image', null);

        Storage::disk('uploads')->assertMissing($second);
    }

    public function test_deleting_a_category_deletes_its_image(): void
    {
        $this->post('/v1/admin/categories', [
            'name' => 'Prawn',
            'image' => UploadedFile::fake()->image('a.jpg', 800, 600),
        ], ['Accept' => 'application/json'])->assertCreated();

        $category = Category::query()->sole();

        $this->deleteJson("/v1/admin/categories/{$category->id}")->assertNoContent();

        Storage::disk('uploads')->assertMissing($category->image);
    }

    public function test_html_php_and_sql_are_rejected_in_category_fields(): void
    {
        foreach (['<script>alert(1)</script>', '<?php system("id"); ?>', "Fish' OR '1'='1", 'x UNION SELECT password FROM users'] as $payload) {
            $this->postJson('/v1/admin/categories', ['name' => $payload])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('name');
        }

        $this->postJson('/v1/admin/categories', ['name' => 'Fish & Seafood', 'description' => "Fresh hilsa, 1-2 kg each. Rahim's pick!"])
            ->assertCreated();
    }
}
