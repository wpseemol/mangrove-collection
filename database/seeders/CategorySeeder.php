<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Mangrove Raw Honey',
                'slug' => 'mangrove-raw-honey',
                'image' => '/assets/default/category/Mangrove-Raw-Honey.png',
                'position' => 1,
                'draft' => false,
            ],
            [
                'name' => 'Sewed Fish',
                'slug' => 'fish',
                'image' => '/assets/default/category/Sewed-Fish.png',
                'position' => 2,
                'draft' => false,
            ],
            [
                'name' => 'Mangrove Crab',
                'slug' => 'crab',
                'image' => '/assets/default/category/Mangrove-Crab.png',
                'position' => 3,
                'draft' => false,
            ],
            [
                'name' => 'Mangrove Prawns',
                'slug' => 'prawns',
                'image' => '/assets/default/category/Mangrove-Prawns.png',
                'position' => 4,
                'draft' => false,
            ],
            [
                'name' => 'Mustard oil',
                'slug' => 'mustard-oil',
                'image' => '/assets/default/category/Mustard-Oil.png',
                'position' => 5,
                'draft' => false,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
