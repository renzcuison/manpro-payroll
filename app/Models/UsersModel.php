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
        'gender',

        'address',
        'contact_number',
        'email',
        'password',

        'user_type',
        'salary_type',
        'salary',

        'profile_pic',
        'verify_code',
        'code_expiration',
        'is_verified',

        'date_start',
        'date_end',

        'employment_type',
        'employment_status',

        'client_id',
        'branch_id',
        'department_id',
        'role_id',
        'job_title_id',
        'work_group_id',
    ];
}
