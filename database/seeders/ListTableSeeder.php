<?php

namespace Database\Seeders;

use App\Models\ListModel;
use Illuminate\Database\Seeder;

class ListTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ListModel::factory()->count(5)->create();
    }
}
