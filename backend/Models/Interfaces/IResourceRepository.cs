using System;
using backend.Models.Entities;

namespace backend.Models.Interfaces;

public interface IResourceRepository
{
    Task<List<Resource>> GetAll(CancellationToken ct = default);
    Task<Resource?> GetById(int id, CancellationToken ct = default);
}
