<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoanApplicationsModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'loan_applications';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'loan_amount',
        'reason',
        'status',
        'payment_term',
        'approved_by',
    ];

    public function files()
    {
        return $this->hasMany(LoanApplicationFilesModel::class, 'loan_application_id');
    }

    // Define the relationship with the UsersModel (employee)
    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'employee_id', 'id');
    }

    // Define the relationship with the Department model through UsersModel
    public function department()
    {
        return $this->hasOneThrough(
            DepartmentsModel::class,
            UsersModel::class,
            'id',               // users.id
            'id',               // departments.id
            'employee_id',     // Foreign key to users.id
            'department_id'    // Foreign key to departments.id
        );
    }

    // Define the relationship with the Branch model through UsersModel
    public function branch()
    {
        return $this->hasOneThrough(
            BranchesModel::class,
            UsersModel::class,
            'id',               // users.id
            'id',               // branches.id
            'employee_id',     // Foreign key to users.id
            'branch_id'        // Foreign key to branches.id
        );
    }

    // Define the relationship with the JobTitle model through UsersModel
    public function jobTitle()
    {
        return $this->hasOneThrough(
            JobTitlesModel::class,
            UsersModel::class,
            'id',               // users.id
            'id',               // job_titles.id
            'employee_id',     // Foreign key to users.id
            'job_title_id'     // Foreign key to job_titles.id
        );
    }
}