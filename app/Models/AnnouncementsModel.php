<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class AnnouncementsModel extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $table = 'announcements';

    protected $primaryKey = 'id';

    protected $fillable = [
        'unique_code',
        'user_id',
        'client_id',
        'title',
        'status',
        'description',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents');
        $this->addMediaCollection('images');
        $this->addMediaCollection('thumbnails')->singleFile();
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function branches()
    {
        return $this->hasMany(AnnouncementBranchesModel::class, 'announcement_id');
    }

    public function departments()
    {
        return $this->hasMany(AnnouncementDepartmentsModel::class, 'announcement_id');
    }

    public function views()
    {
        return $this->hasMany(AnnouncementViewsModel::class, 'announcement_id', 'id');
    }

    public function acknowledgements()
    {
        return $this->hasMany(AnnouncementAcknowledgementsModel::class, 'announcement_id');
    }
}
