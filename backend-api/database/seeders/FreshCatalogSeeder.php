<?php

namespace Database\Seeders;

/**
 * Same as CatalogSeeder, but removes every existing product and category first:
 * php artisan db:seed --class=FreshCatalogSeeder
 */
class FreshCatalogSeeder extends CatalogSeeder
{
    protected bool $replace = true;
}
