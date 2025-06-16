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
        'branch_position_id',
        'employment_type',
        'employment_status',

        'client_id',
        'branch_id',
        'department_id',
        'department_position_id',
        'role_id',
        'job_title_id',
        'work_group_id',
        'company_id'
    ];
    
    protected $casts = [
        'birth_date' => 'date',
        'date_start' => 'date',
    ];


    public function branchPosition()
    {
        return $this->belongsTo(BranchPosition::class, 'branch_position_id');
    }

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

    public function departmentPosition()
    {
        return $this->belongsTo(DepartmentPosition::class, 'department_position_id');
    }

   //pivot model connecting department positions and users
    public function employeeDepartmentPositions(){
        return $this->hasMany(EmployeeDepartmentPosition::class, 'employee_id');
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

    public function incentives()
    {
        return $this->hasMany(EmployeeIncentivesModel::class, 'user_id');
    }

    public function benefits()
    {
        return $this->hasMany(EmployeeBenefitsModel::class, 'user_id');
    }

    public function deductions()
    {
        return $this->hasMany(EmployeeDeductionsModel::class, 'user_id');
    }

    public function leaveCredits()
    {
        return $this->hasMany(LeaveCreditsModel::class, 'user_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function commentorResponses()
    {
        return $this->hasManyThrough(
            EvaluationResponse::class,
            EvaluationCommentor::class,
            'commentor_id',
            'id',
            'id',
            'response_id'
        );
    }

    public function createdResponses()
    {
        return $this->hasMany(EvaluationResponse::class, 'creator_id');
    }

    public function evaluateeResponses()
    {
        return $this->hasMany(EvaluationResponse::class, 'evaluatee_id');
    }

    public function evaluatorResponses()
    {
        return $this->hasManyThrough(
            EvaluationResponse::class,
            EvaluationEvaluator::class,
            'evaluator_id',
            'id',
            'id',
            'response_id'
        );
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('profile_pictures')->singleFile();
    }

    public function comments(): hasMany
    {
        return $this->hasMany(MilestoneComment::class, 'user_id');
    }
    
      //employees assigned to department positiosns
    public function assignedDepartmentPositions()
    {
        return $this->belongsToMany(
            DepartmentPositionAssignment::class,
            'employee_department_positions',
            'employee_id',
            'assignment_id'
        );
    }

  
}
