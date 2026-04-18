package com.example.demo.controller;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "https://task-manager-six-murex-90.vercel.app")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    // Use the system's temporary directory - this is the "safest" place to write files
    private final String UPLOAD_DIR = System.getProperty("java.io.tmpdir") + File.separator + "taskmanager_uploads";

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Task createTask(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "dueDate", required = false) String dueDate,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication authentication) {

        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description != null ? description : "");
        task.setStatus("TODO");
        task.setPriority(priority != null ? priority : "MEDIUM");
        task.setDueDate(dueDate != null && !dueDate.isEmpty() ? dueDate : null);
        task.setAssignedTo(authentication.getName());

        List<String> savedFiles = new ArrayList<>();
        
        // We wrap the file logic in a try-catch so that even if it FAILS, 
        // the task itself is still saved to the database!
        if (files != null && files.length > 0) {
            try {
                File directory = new File(UPLOAD_DIR);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                
                for (MultipartFile file : files) {
                    if (file != null && !file.isEmpty()) {
                        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                        Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        savedFiles.add(fileName);
                    }
                }
            } catch (Exception e) {
                // If file saving fails, we just print the error but DO NOT crash the request
                System.out.println("CRITICAL FILE ERROR (Handled): " + e.getMessage());
                e.printStackTrace();
            }
        }

        task.setAttachedDocuments(savedFiles);
        return taskRepository.save(task);
    }
    
    // Keeping your other methods...
    @GetMapping
    public List<Task> getAllTasks(Authentication authentication) {
        return taskRepository.findByAssignedTo(authentication.getName());
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }
}