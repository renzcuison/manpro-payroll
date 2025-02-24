<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnouncementBranchesModel extends Model
{
    use HasFactory;

    protected $table = 'announcement_branches';

    protected $primaryKey = 'id';

    protected $fillable = [
        'announcement_id',
        'branch_id',
    ];

    public function announcement()
    {
        return $this->belongsTo(AnnouncementsModel::class, 'announcement_id');
    }
    public function branch()
    {
        return $this->belongsTo(BranchesModel::class, 'branch_id');
    }
}
