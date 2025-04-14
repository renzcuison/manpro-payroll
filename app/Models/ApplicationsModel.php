<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ApplicationsModel extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $table = 'applications';

    protected $primaryKey = 'id';

    protected $fillable = [
        'type_id',
        'duration_start',
        'duration_end',
        'description',
        'status',
        'leave_used',
        'user_id',
        'client_id',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents');
        $this->addMediaCollection('images');
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function type()
    {
        return $this->belongsTo(ApplicationTypesModel::class, 'type_id');
    }

    public function department()
    {
        return $this->hasOneThrough(
            DepartmentsModel::class,
            UsersModel::class,
            'id',               // users.id
            'id',               // departments.id
            'user_id',          // Foreign key to users.id
            'department_id'     // Foreign key to departments.id
        );
    }

    public function branch()
    {
        return $this->hasOneThrough(
            BranchesModel::class,
            UsersModel::class,
            'id',               // users.id
            'id',               // branches.id
            'user_id',          // Foreign key to users.id
            'branch_id'         // Foreign key to branches.id
        );
    }

    public function jobTitle()
    {
        return $this->hasOneThrough(
            JobTitlesModel::class,
            UsersModel::class,
            'id',               // users.id
            'id',               // job_titles.id
            'user_id',          // Foreign key to users.id
            'job_title_id'      // Foreign key to job_titles.id
        );
    }
}
