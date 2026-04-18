package com.example.demo.controller;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import java.util.stream.Collectors;

@CrossOrigin(origins = "https://task-manager-six-murex-90.vercel.app")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

   
    private final String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "uploads";

    @GetMapping
    public List<Task> getAllTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "id") String sortBy,
            Authentication authentication) {
        
        String username = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<Task> tasks = isAdmin ? taskRepository.findAll() : taskRepository.findByAssignedTo(username);

        return tasks.stream()
            .filter(t -> status == null || status.isEmpty() || t.getStatus().equalsIgnoreCase(status))
            .filter(t -> priority == null || priority.isEmpty() || t.getPriority().equalsIgnoreCase(priority))
            .sorted((t1, t2) -> {
                if ("priority".equals(sortBy)) return t1.getPriority().compareTo(t2.getPriority());
                if ("dueDate".equals(sortBy)) {
                    if (t1.getDueDate() == null) return 1;
                    if (t2.getDueDate() == null) return -1;
                    return t1.getDueDate().compareTo(t2.getDueDate());
                }
                return t1.getId().compareTo(t2.getId());
            })
            .collect(Collectors.toList());
    }
    
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
        task.setDueDate(dueDate);
        task.setAssignedTo(authentication.getName());

        List<String> savedFiles = new ArrayList<>();
        if (files != null && files.length > 0) {
            try {
                
                File directory = new File(UPLOAD_DIR);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                        Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        savedFiles.add(fileName);
                    }
                }
            } catch (Exception e) {
                // LOG THE ERROR so it doesn't cause a 500 error for the whole request
                System.out.println("FILE SYSTEM ERROR: " + e.getMessage());
            }
        }

        task.setAttachedDocuments(savedFiles);
        return taskRepository.save(task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }

    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}