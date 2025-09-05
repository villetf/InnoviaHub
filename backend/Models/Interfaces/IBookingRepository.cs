using System;

namespace backend.Models.Interfaces;

public interface IBookingRepository
{
    Task<List<Booking>> GetAll(CancellationToken ct = default);
    Task<Booking?> GetById(int id, CancellationToken ct = default);
    Task<Booking> Add(Booking booking, CancellationToken ct = default);
    Task<Booking?> Update(Booking booking, CancellationToken ct = default);
    Task<bool> Delete(int id, CancellationToken ct = default);

    //Kolla om en bokning krockar med en som redan finns
    Task<bool> HasOverlap(int resourceId, DateTime start, DateTime end, int? ignoreBookingId = null, CancellationToken ct = default);
}
