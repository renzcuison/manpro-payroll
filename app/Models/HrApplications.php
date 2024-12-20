<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrApplications extends Model
{
    use HasFactory;
    protected $table = 'hr_applications';

    protected $primaryKey = 'application_id';

    public $timestamps = false;

    protected $fillable = [
        'leave_type',
        'percentage',
        'date_from',
        'date_to',
        'app_file', 
        'remarks',
        'app_hours',
        'user_id',
        'applist_id',
        'is_deleted',
        'created_at', //added to match db table
        'deleted_by', //added to match db tabel
        'color',
        'status',
        'app_status_id', //added to match db table
        'limit_remain'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
