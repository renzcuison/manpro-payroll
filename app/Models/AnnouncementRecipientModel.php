<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\EmployeeRolesModel;
use App\Models\BranchesModel;
use App\Models\UsersModel;

class AnnouncementRecipientModel extends Model
{
    use HasFactory;

    protected $table = 'announcement_recipients';

    protected $fillable = [
        'announcement_id',
        'branch_id',
        'department_id',
        'role_id',
        'employment_type',
        'employment_status',
        'user_id',
    ];

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id');
    }

    public function role()
    {
        return $this->belongsTo(EmployeeRolesModel::class, 'role_id');
    }

    public function branch()
    {
        return $this->belongsTo(BranchesModel::class, 'branch_id');
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

}