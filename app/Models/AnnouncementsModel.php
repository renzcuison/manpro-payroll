<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use App\Models\AnnouncementRecipientModel;

class AnnouncementsModel extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, SoftDeletes;

    protected $table = 'announcements';

    protected $primaryKey = 'id';

    protected $fillable = [
        'unique_code',
        'user_id',
        'client_id',
        'title',
        'status',
        'description',
        'scheduled_send_datetime', 
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
    public function recipients()
    {
        return $this->hasMany(AnnouncementRecipientModel::class, 'announcement_id');
    }
}
