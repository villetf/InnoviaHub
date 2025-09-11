using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResourceController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ResourceController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetByType(
            [FromQuery] int typeId,
            [FromQuery] DateTime? start,
            [FromQuery] DateTime? end,
            CancellationToken ct)
        {
            if (typeId <= 0) return BadRequest("typeId krävs.");

            var s = start ?? DateTime.UtcNow;
            var e = end   ?? DateTime.UtcNow;
            if (e <= s) return BadRequest("end måste vara efter start.");

            //Hämta resurser av typen
            var resources = await _db.Resources
                .Include(r => r.ResourceType)
                .Where(r => r.ResourceTypeId == typeId)
                .AsNoTracking()
                .ToListAsync(ct);

            var resIds = resources.Select(r => r.Id).ToList();

            //Hämta bokningar för dessa resurser
            var bookings = await _db.Bookings
                .Where(b => resIds.Contains(b.ResourceId))
                .AsNoTracking()
                .ToListAsync(ct);

            //Kolla tillgänglighet
            var result = resources.Select(r =>
            {
                var overlap = bookings.Any(b =>
                    b.ResourceId == r.Id &&
                    s < b.EndTime && e > b.StartTime
                );
                return new
                {
                    r.Id,
                    r.Name,
                    r.ResourceTypeId,
                    ResourceTypeName = r.ResourceType!.Name,
                    isAvailable = !overlap
                };
            });

            return Ok(result);
        }
    }
}
