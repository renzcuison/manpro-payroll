<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnnouncementViewsModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'announcement_views';

    protected $primaryKey = 'id';

    protected $fillable = [
        'announcement_id',
        'user_id',
        'viewed_at',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id', 'id');
    }

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id', 'id');
    }
}