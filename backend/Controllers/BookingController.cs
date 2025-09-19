using backend.Models;
using backend.Models.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // Tillåt anonyma anrop för test
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookings;
        private readonly IResourceRepository _resources;

        public BookingController(IBookingRepository bookings, IResourceRepository resources)
        {
            _bookings = bookings;
            _resources = resources;
        }

        //GET api/booking
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingReadDto>>> GetAll(CancellationToken ct)
        {
            var all = await _bookings.GetAll(ct);
            return Ok(all.Select(b => ToReadDto(b)));
        }

        //GET api/booking/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookingReadDto>> GetById(int id, CancellationToken ct)
        {
            var b = await _bookings.GetById(id, ct);
            if (b is null) return NotFound();
            return Ok(ToReadDto(b));
        }

        //GET api/booking/user/{userId}
        [HttpGet("user/{userId:guid}")]
        public async Task<ActionResult<IEnumerable<BookingReadDto>>> GetByUserId(Guid userId, CancellationToken ct)
        {
            var all = await _bookings.GetAll(ct);
            var userBookings = all.Where(b => b.UserId == userId);
            return Ok(userBookings.Select(b => ToReadDto(b)));
        }

        //POST api/booking
        [HttpPost]
        public async Task<ActionResult<BookingReadDto>> Create([FromBody] BookingCreateDto dto, CancellationToken ct)
        {
            //Vallidera tid
            if(dto.EndTime <= dto.StartTime)
                return BadRequest(new {message = "EndTime måste vara efter StartTime"});

            //Vallidera resurs
            var resource = await _resources.GetById(dto.ResourceId, ct);
            if(resource is null) return BadRequest(new {message = "Ogiltigt ResourceId"});

            //Kolla krockar
            /*if (await _bookings.HasOverlap(dto.ResourceId, dto.StartTime, dto.EndTime, null, ct))
                return Conflict("Tiden krockar med en befintlig boking");*/

            //Skapa bokning
            var booking = new Booking
            {
                UserId = dto.UserId,
                UserName = dto.UserName,
                ResourceId = dto.ResourceId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Confirmed" : dto.Status
            };

            var created = await _bookings.Add(booking, ct);
            return CreatedAtAction(nameof(GetById), new {id = created.Id}, ToReadDto(created));
        }

        //PUT api/booking/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult<BookingReadDto>> Update(int id, [FromBody] BookingUpdateDto dto, CancellationToken ct)
        {
            //Vallidera tid
            if(dto.EndTime <= dto.StartTime)
                return BadRequest(new {message = "EndTime måste vara efter StartTime"});

            //Vallidera resurs
            var resource = await _resources.GetById(dto.ResourceId, ct);
            if(resource is null) return BadRequest(new {message = "Ogiltigt ResourceId"});

            //Kolla krockar
            //if (await _bookings.HasOverlap(dto.ResourceId, dto.StartTime, dto.EndTime, null, ct))
              //  return Conflict("Tiden krockar med en befintlig boking");

            var toUpdate = new Booking
            {
                Id = id,
                UserId = dto.UserId,
                UserName = dto.UserName,
                ResourceId = dto.ResourceId,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Confirmed" : dto.Status
            };

            var updated = await _bookings.Update(toUpdate, ct);
            if(updated is null) return NotFound();

            var withNav = await _bookings.GetById(id, ct) ?? updated;
            return Ok(ToReadDto(withNav));
        }

        //DELETE api/booking/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var ok = await _bookings.Delete(id, ct);
            return ok ? NoContent() : NotFound();
        }




        //Konvertera enititet till DTO
        private static BookingReadDto ToReadDto(Booking b) =>
            new(b.Id, b.UserId, b.UserName, b.ResourceId, b.Resource?.Name ?? "", b.StartTime, b.EndTime, b.Status, b.CreatedAt);

    }
}
