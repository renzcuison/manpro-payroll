<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class UsersModel extends Authenticatable implements HasMedia
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, InteractsWithMedia;

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
        'is_fixed_salary',
        'tin_number',
        'deduct_tax',

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
        'company_id'
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

    public function latestAttendanceLog()
    {
        return $this->hasOne(AttendanceLogsModel::class, 'user_id')->latestOfMany();
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

    // public function educations(): HasMany{
    //     return $this.hasMany(EmployeeEducation::class, 'user_id');
    // }

    public function allowances()
    {
        return $this->hasMany(EmployeeAllowancesModel::class, 'user_id');
    }

    public function leaveCredits()
    {
        return $this->hasMany(LeaveCreditsModel::class, 'user_id');
    }

    public function company(): BelongsTo
    {
        return $this->BelongsTo(Company::class, 'company_id');
    }


    public function approverOf() {
    return $this->hasMany(BranchApprover::class);
    }

    public function managerOf() {
        return $this->hasMany(BranchManager::class);
    }

    public function supervisorOf() {
        return $this->hasMany(BranchSupervisor::class);
    }
    
}