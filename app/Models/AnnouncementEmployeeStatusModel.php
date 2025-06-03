<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementEmployeeStatusModel extends Model
{
    use HasFactory;

    protected $table = 'announcement_employee_statuses';

    protected $primaryKey = 'id';

    protected $fillable = [
        'announcement_id',
        'employment_status',
    ];

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id');
    }
}