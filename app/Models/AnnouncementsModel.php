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
        'user_id',
        'client_id',
        'title',
        'status',
        'description',
    ];

    public function files()
    {
        return $this->hasMany(AnnouncementFilesModel::class, 'announcement_id');
    }

    public function branches()
    {
        return $this->hasMany(AnnouncementBranchesModel::class, 'announcement_id');
    }

    public function departments()
    {
        return $this->hasMany(AnnouncementDepartmentsModel::class, 'announcement_id');
    }

    public function acknowledgements()
    {
        return $this->hasMany(AnnouncementAcknowledgementsModel::class, 'announcement_id');
    }
}
