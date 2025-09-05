using System;
using backend.Models.Entities;
using backend.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Models.Repositories;

public class ResourceRepository : IResourceRepository
{
    private readonly AppDbContext _dbContext;
    public ResourceRepository(AppDbContext dbContext) => _dbContext = dbContext;
    public async Task<List<Resource>> GetAll(CancellationToken ct = default) =>
        await _dbContext.Resources.Include(r => r.ResourceType).ToListAsync(ct);

    public async Task<Resource?> GetById(int id, CancellationToken ct = default) =>
        await _dbContext.Resources.Include(r => r.ResourceType).FirstOrDefaultAsync(r => r.Id == id, ct);
}
