### Migrating to 1.0.0
#### What to do
**`gm-markers`**
- rename all `gm-get-lat-lng` attributes to `gm-position`
- rename all `gm-get-marker-options` to `gm-marker-options`
- add the `gm-id` attribute (see how to use it in the [docs](http://dylanfprice.github.io/angular-gm/1.0.0/docs/#/api/angulargm.directive:gmMarkers))

**`gm-polylines`**
- rename all `gm-get-path` attributes to `gm-path`
- rename all `gm-get-polyline-options` to `gm-polyline-options`
- add the `gm-id` attribute (see how to use it in the [docs](http://dylanfprice.github.io/angular-gm/1.0.0/docs/#/api/angulargm.directive:gmPolylines))

### Why it changed
The major change in 1.0.0 is the introduction of the `gm-id` property for `gm-markers` and `gm-polylines`. The reason for this change is that it doesn't make sense to uniquely identify a marker/object by it's position because (a) you may have multiple marker/objects with the same position and (b) the position of a marker/object might change over time. Furthermore, the `gm-polylines` directive was being unnecessarily limited in functionality (for one, `gm-on-*event*` and `gm-events` were not supported) because the 'position' of a polyline is a much more complex representation than the position of a marker. With unique ids for each polyline and marker, it becomes much easier to support more use cases and be smarter about when and how markers and polylines are updated.

Since I was making a breaking api change anyway, I decided to roll in renaming of some attributes whose names had been bothering me for a while.

There are even more changes that made it in to the release. The `gmMapIdle` event and the `gmMarkersUpdate`/`gmPolylinesUpdate` events, to name a few. See the [changelog](CHANGELOG.md) for a full list.

