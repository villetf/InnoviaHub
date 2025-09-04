using System;

namespace backend.Models.Interfaces;

public interface IBookingRepository
{
    Task<List<Booking>> GetAll(CancellationToken ct = default);
    Task<Booking?> GetById(int id, CancellationToken ct =default);
    
}
