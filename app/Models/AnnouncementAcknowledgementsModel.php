<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementAcknowledgementsModel extends Model
{
    use HasFactory;

    protected $table = 'announcement_acknowledgements';

    protected $fillable = [
        'announcement_id',
        'user_id',
    ];

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id');
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }
}
