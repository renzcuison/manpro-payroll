<?php

namespace Database\Factories;

use App\Models\ListModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class StatusFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'status_name' => $this->faker->firstName(),
            'status_list_id' => ListModel::inRandomOrder()->first(),
            'status__date_created' => $this->faker->dateTime()
        ];
    }
}
