<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementsModel extends Model
{
    use HasFactory;

    protected $table = 'announcements';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'user_id',
        'client_id',
        'title',
        'published',
        'description',
    ];

    public function files()
    {
        return $this->hasMany(AnnouncementFilesModel::class, 'announcement_id');
    }
}
