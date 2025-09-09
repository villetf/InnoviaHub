using backend.Models;
using backend.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourceTypeController : ControllerBase
    {
        private readonly AppDbContext _dbContext;
        public ResourceTypeController (AppDbContext dbContext) => _dbContext = dbContext;

        //GET /api/resourcetype
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResourceType>>> GetAll(CancellationToken ct)
            => Ok(await _dbContext.ResourceTypes.AsNoTracking().ToListAsync(ct));
    }
}
