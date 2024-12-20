<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Space;

class ListModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'list_name' => $this->faker->slug(),
            'list_space_id' => Space::inRandomOrder()->first(),
            'list_date_created' => $this->faker->dateTime(),
        ];
    }
}
