using backend.Models;
using backend.Models.Entities;
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

        //GET api/resource/id
        [HttpGet("{id:int}")]
        public async Task<ActionResult<object>> GetById(int id, CancellationToken ct) {
            var r = await _db.Resources
                .Include(x => x.ResourceType)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, ct);

            if (r is null) return NotFound();

            return Ok(new
            {
                r.Id,
                r.Name,
                r.ResourceTypeId,
                ResourceTypeName = r.ResourceType?.Name
            });
        }

        //POST api/resource
        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] ResourceCreateDto dto, CancellationToken ct)
        {
            //Validering
            if(string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Namn krävs");
            if(dto.ResourceTypeId <= 0)
                return BadRequest("Giltig ResourceTypeId krävs");

            //Kontrollera att resurstypen finns
            var typeExists = await _db.ResourceTypes.AnyAsync(t => t.Id == dto.ResourceTypeId, ct);
            if(!typeExists) return BadRequest("Ogiltigt resourcetypeid");

            var entity = new Resource
            {
                Name = dto.Name.Trim(),
                ResourceTypeId = dto.ResourceTypeId
            };

            _db.Resources.Add(entity);
            await _db.SaveChangesAsync(ct);

            var created = await _db.Resources
                .Include(r => r.ResourceType)
                .FirstAsync(r => r.Id == entity.Id, ct);

            var read = new
            {
                created.Id,
                created.Name,
                created.ResourceTypeId,
                ResourceTypeName = created.ResourceType?.Name
            };

            return CreatedAtAction(nameof(GetById), new {id = created.Id}, read);
        }

        //PUT api/resource/id
        [HttpPut("{id:int}")]
        public async Task<ActionResult<object>> Update(int id, [FromBody] ResourceUpdateDto dto, CancellationToken ct)
        {
            if (id <= 0) return BadRequest("Ogiltigt id");
            if(string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Namn krävs");
            if (dto.ResourceTypeId <= 0) return BadRequest("Giltigt resourcetypeid krävs");

            var typeExists = await _db.ResourceTypes.AnyAsync(t => t.Id == dto.ResourceTypeId, ct);
            if (!typeExists) return BadRequest("Ogiltigt resourcetypeid");

            var entity = await _db.Resources.FirstOrDefaultAsync(r => r.Id == id, ct);
            if(entity is null) return NotFound();

            entity.Name = dto.Name.Trim();
            entity.ResourceTypeId = dto.ResourceTypeId;

            await _db.SaveChangesAsync(ct);

            var updated = await _db.Resources
                .Include(r => r.ResourceType)
                .AsNoTracking()
                .FirstAsync(r => r.Id == id, ct);

                return Ok(new
                {
                    updated.Id,
                    updated.Name,
                    updated.ResourceTypeId,
                    ResourceTypeName = updated.ResourceType?.Name
                });
        }

        //DELETE api/resource/id
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            if(id <= 0) return BadRequest("Ogiltigt id");

            var entity = await _db.Resources.FirstOrDefaultAsync(r => r.Id == id, ct);
            if(entity is null) return NotFound();

            //Blockera radering om resursen har bokning
            var hasBooking = await _db.Bookings.AnyAsync(b => b.ResourceId == id, ct);
            if(hasBooking)
                return Conflict("Resursen kan inte raderas pga att den har bokningar");

            _db.Resources.Remove(entity);
            await _db.SaveChangesAsync(ct);

            return NoContent();
        }
    }
}
