<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'fname' => $this->faker->firstName(),
            'mname' => $this->faker->lastName(),
            'lname' => $this->faker->lastName(),
            'username' => $this->faker->userName(),
            'address' => $this->faker->address(),
            'user_type' => $this->faker->randomElement(['Admin','Supervisory','Financial']),
            'email' => $this->faker->unique()->safeEmail(),
            'contact_number' => $this->faker->unique()->phoneNumber(),
            'bdate' => $this->faker->dateTime(),
            'password' => 'test', // password
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
//    public function unverified()
//    {
//        return $this->state(function (array $attributes) {
//            return [
//                'email_verified_at' => null,
//            ];
//        });
//    }
}
