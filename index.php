<?php include 'db.php'; ?>
<?php include 'header.php'; ?>

<div class="container">
    <h1 class="mt-4">Calendar</h1>
    
    <div id="calendar-controls" class="mb-3">
        <button id="prevMonth" class="btn btn-secondary">Previous Month</button>
        <button id="nextMonth" class="btn btn-secondary">Next Month</button>
    </div>
    
    <div id="calendar" class="table-responsive"></div>
    
    <div id="eventModal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add Event</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="eventForm">
                        <div class="form-group">
                            <label for="title">Event Title</label>
                            <input type="text" class="form-control" id="title" required>
                        </div>
                        <div class="form-group">
                            <label for="start_date">Start Date</label>
                            <input type="datetime-local" class="form-control" id="start_date" required>
                        </div>
                        <div class="form-group">
                            <label for="end_date">End Date</label>
                            <input type="datetime-local" class="form-control" id="end_date" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea class="form-control" id="description"></textarea>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="isAnnual" value="1">
                            <label class="form-check-label" for="isAnnual">Repeat Every Year</label>
                        </div>
                        <input type="hidden" id="event_id">
                        <input type="hidden" id="event_date">
                        <button type="submit" class="btn btn-primary">Add Event</button>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="deleteEventBtn" style="display:none;">Delete Event</button>
                </div>
            </div>
        </div>
    </div>

    <div class="event-list">
        <h4 class="mt-4">Events for Selected Date</h4>
        <ul id="eventList" class="list-group">
            <!-- Events will rendered by js -->
        </ul>
    </div>
</div>

<script src="script.js"></script> 
<?php include 'footer.php'; ?>
