<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementFilesModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'announcement_files';

    protected $primaryKey = 'id';

    protected $fillable = [
        'announcement_id',
        'type',
        'path',
        'thumbnail',
    ];
}
