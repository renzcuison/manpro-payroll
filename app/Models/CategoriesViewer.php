<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriesViewer extends Model
{
    use HasFactory;

    protected $table = 'categories_viewers';

    protected $primaryKey = 'view_id';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'category_id',
        'team',
        'is_deleted',
        'deleted_by',
        'created_at'
    ];
}
