<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementEmployeeTypeModel extends Model
{
    use HasFactory;

    protected $table = 'announcement_employee_types';

    protected $primaryKey = 'id';

    protected $fillable = [
        'announcement_id',
        'employment_type',
    ];

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id');
    }
}