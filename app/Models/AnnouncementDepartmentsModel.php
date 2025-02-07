<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementDepartmentsModel extends Model
{
    use HasFactory;

    protected $table = 'announcement_departments';

    protected $primaryKey = 'id';

    protected $fillable = [
        'announcement_id',
        'department_id',
    ];

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id');
    }
}
