<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class UsersModel extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'user_name',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'birth_date',

        'address',
        'contact_number',
        'email',
        'password',

        'user_type',
        'profile_pic',

        'verify_code',
        'code_expiration',
        'is_verified',

        'client_id',
    ];
}
