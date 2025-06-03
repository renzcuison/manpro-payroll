<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementEmployeeRoleModel extends Model
{
    use HasFactory;

    protected $table = 'announcement_employee_role';

    protected $primaryKey = 'id';

    protected $fillable = [
        'announcement_id',
        'role_id',
    ];

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id');
    }
    public function role()
    {
        return $this->belongsTo(EmployeeRolesModel::class, 'role_id');
    }
}