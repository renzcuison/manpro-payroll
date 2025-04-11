<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'user';

    protected $primaryKey = 'user_id';

    const CREATED_AT = 'date_created';

    public $timestamps = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'fname',
        'mname',
        'lname',
        'address',
        'contact_number',
        'email',
        'bdate',
        'username',
        'password',
        'user_type',
        'profile_pic',
        'user_color',
        'team',
        'log',
        'hourly_rate',
        'daily_rate',
        'monthly_rate',
        'work_days',
        'department_id',
        'department',
        'category_id',
        'category',
        'date_created',
        'date_hired',
        'status',
        'sss',
        'philhealth',
        'pagibig',
        'atm',
        'bank',
        'is_deleted',
        'deleted_by',
        'limit',
        'hr_workshift_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function workShift()
    {
        return $this->belongsTo(HrWorkshifts::class, 'hr_workshift_id');
    }

    public function evaluationForms()
    {
        return $this->hasMany(EvaluationForm::class, 'employee_id', 'user_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

}