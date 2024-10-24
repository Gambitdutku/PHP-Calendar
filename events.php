<?php
include 'db.php';

// Handle incoming requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    // Add new event
    if ($action === 'add') {
        $title = $_POST['title'];
        $start_date = $_POST['start_date'];
        $end_date = $_POST['end_date'];
        $description = $_POST['description'];
        $isAnnual = $_POST['isAnnual'];

        // Validate event date against current date
        $currentDate = date('Y-m-d H:i:s');
        if ($start_date < $currentDate) {
            echo json_encode(['status' => 'error', 'message' => 'Cannot create events in the past.']);
            exit;
        }

        // Insert into events table or annual_events table based on isAnnual flag
        if ($isAnnual === '1') {
            $stmt = $pdo->prepare("INSERT INTO annual_events (title, event_date) VALUES (?, ?)");
            $stmt->execute([$title, $start_date]);
            echo json_encode(['status' => 'success', 'message' => 'Annual event added successfully.']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO events (title, start_date, end_date, description) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $start_date, $end_date, $description]);
            echo json_encode(['status' => 'success', 'message' => 'Event added successfully.']);
        }
        exit;
    }

    // Delete event
    if ($action === 'delete') {
        $id = $_POST['id'];
        $title = $_POST['title']; // Event title to differentiate events

        // Check if the event exists in the events table
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM events WHERE id = ? AND title = ?");
        $stmt->execute([$id, $title]);
        $eventExists = $stmt->fetchColumn();

        if ($eventExists) {
            // Event exists in events table, delete it
            $stmt = $pdo->prepare("DELETE FROM events WHERE id = ? AND title = ?");
            $stmt->execute([$id, $title]);
            echo json_encode(['status' => 'success', 'message' => 'Event deleted successfully from events table.']);
            exit;
        }

        // Check if the event exists in the annual_events table
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM annual_events WHERE id = ? AND title = ?");
        $stmt->execute([$id, $title]);
        $annualEventExists = $stmt->fetchColumn();

        if ($annualEventExists) {
            // Event exists in annual_events table, delete it
            $stmt = $pdo->prepare("DELETE FROM annual_events WHERE id = ? AND title = ?");
            $stmt->execute([$id, $title]);
            echo json_encode(['status' => 'success', 'message' => 'Event deleted successfully from annual events table.']);
            exit;
        }

        // If event not found in either table
        echo json_encode(['status' => 'error', 'message' => 'Event not found.']);
    }
}

// Fetch events
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'fetch') {
    // Today's date for event filtering
    $today = date('Y-m-d');
    $events = [];
    
    // Fetch upcoming events
    $stmt = $pdo->prepare("SELECT * FROM events WHERE start_date >= ? ORDER BY start_date");
    $stmt->execute([$today]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch annual events
    $annual_events = [];
    $stmt = $pdo->prepare("SELECT * FROM annual_events");
    $stmt->execute();
    $annual_events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Combine and send back events
    echo json_encode(['events' => $events, 'annual_events' => $annual_events]);
    exit;
}
?>
