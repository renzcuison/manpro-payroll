<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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

    public function role()
    {
        return $this->belongsTo(EmployeeRolesModel::class, 'role_id');
    }

    public function jobTitle()
    {
        return $this->belongsTo(JobTitlesModel::class, 'job_title_id');
    }

    public function branch()
    {
        return $this->belongsTo(BranchesModel::class, 'branch_id');
    }

    public function department()
    {
        return $this->belongsTo(DepartmentsModel::class, 'department_id');
    }

    public function workGroup()
    {
        return $this->belongsTo(WorkGroupsModel::class, 'work_group_id');
    }

    public function attendanceLogs()
    {
        return $this->hasMany(AttendanceLogsModel::class, 'user_id');
    }

    public function tax()
    {
        return $this->hasOne(EmployeeTaxesModel::class, 'employee_id');
    }

    public function workShift()
    {
        return $this->hasOneThrough(
            WorkShiftsModel::class,
            WorkGroupsModel::class,
            'id',            // Foreign key on work_groups table (local key)
            'id',            // Foreign key on work_shifts table
            'work_group_id', // Local key on users table
            'work_shift_id'  // Local key on work_groups table
        );
    }

    public function workHours()
    {
        return $this->hasOneThrough(
            WorkHoursModel::class,
            WorkShiftsModel::class,
            'id',            // Foreign key on work_shifts table (local key)
            'id',            // Foreign key on work_hours table
            'work_group_id', // Foreign key on users table
            'work_hour_id'   // Local key on work_shifts table
        );
    }

    public function company(): HasOne
    {
        return $this->hasOne(Company::class, 'user_id');
    }
}