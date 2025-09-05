using System;
using backend.Hubs;
using backend.Models.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Models.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _dbContext;
    private readonly IHubContext<BookingHub> _hubContext;

    public BookingRepository(AppDbContext dbContext, IHubContext<BookingHub> hubContext)
    {
        _dbContext = dbContext;
        _hubContext = hubContext;
    }

    public async Task<Booking> Add(Booking booking, CancellationToken ct = default)
    {
        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync(ct);

        //Skicka till alla ansluta klienter
        await _hubContext.Clients.All.SendAsync("BookingCreated", booking, ct);
        return booking;
    }

    public async Task<bool> Delete(int id, CancellationToken ct = default)
    {
        var existing = await _dbContext.Bookings.FirstOrDefaultAsync(b => b.Id == id, ct);
        if(existing is null) return false;

        _dbContext.Bookings.Remove(existing);
        await _dbContext.SaveChangesAsync(ct);

        //Skickar delete eventet
        await _hubContext.Clients.All.SendAsync("BookingDeleted", id, ct);
        return true;
    }

    public async Task<List<Booking>> GetAll(CancellationToken ct = default) => 
        await _dbContext.Bookings.Include(b => b.Resource).ToListAsync(ct);

    public async Task<Booking?> GetById(int id, CancellationToken ct = default) =>
        await _dbContext.Bookings.Include(b => b.Resource).FirstOrDefaultAsync(b => b.Id == id, ct);

    //Lite osäker på om det här behövs, men better safe than sorry
    public async Task<bool> HasOverlap(int resourceId, DateTime start, DateTime end, int? ignoreBookingId = null, CancellationToken ct = default)
    {
        return await _dbContext.Bookings
            .Where(b => b.ResourceId == resourceId && (ignoreBookingId == null || b.Id != ignoreBookingId))
            .AnyAsync(b => start < b.EndTime && end > b.StartTime, ct);
    }

    public async Task<Booking?> Update(Booking booking, CancellationToken ct = default)
    {
        var existing = await _dbContext.Bookings.FirstOrDefaultAsync(b => b.Id == booking.Id, ct);
        if( existing is null) return null;

        _dbContext.Entry(existing).CurrentValues.SetValues(booking);
        await _dbContext.SaveChangesAsync(ct);

        //Skicka update eventet
        await _hubContext.Clients.All.SendAsync("BookingUpdated", booking, ct);
        return existing;
    }
}
