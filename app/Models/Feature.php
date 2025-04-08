<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    use HasFactory;
    protected $guarded = [];
    /**
     * The packages that belong to the feature.
     */
    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(Package::class);
    }
}