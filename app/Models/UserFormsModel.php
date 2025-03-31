<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserFormsModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'user_forms';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'unique_code',
        'limit',
        'used',
        'expiration',
        'status',
        'branch_id',
        'department_id',
        'created_by',
        'deleted_by',
    ];

    public function branch()
    {
        return $this->belongsTo(BranchesModel::class, 'branch_id');
    }

    public function department()
    {
        return $this->belongsTo(DepartmentsModel::class, 'department_id');
    }
}
