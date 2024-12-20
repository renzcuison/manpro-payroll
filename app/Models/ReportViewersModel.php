<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportViewersModel extends Model
{
    use HasFactory;

    protected $table = 'report_viewers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'report_id',
        'viewer_id',
        'created_at',
        'updated_at',
    ];

    public function report()
    {
        return $this->belongsTo(ReportsModel::class, 'report_id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'user_id', 'viewer_id');
    }
}
