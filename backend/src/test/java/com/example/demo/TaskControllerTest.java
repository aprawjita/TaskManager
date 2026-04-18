package com.example.demo;

import com.example.demo.controller.TaskController;
import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

public class TaskControllerTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TaskController taskController;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetTasksForUser() {
        Task task = new Task();
        task.setId(1L);
        task.setTitle("Test Task");
        task.setStatus("TODO");
        task.setPriority("HIGH");
        task.setAssignedTo("user@test.com");

        when(authentication.getName()).thenReturn("user@test.com");
        
        Collection authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        doReturn(authorities).when(authentication).getAuthorities();

        List<Task> tasks = Arrays.asList(task);
        when(taskRepository.findByAssignedTo("user@test.com")).thenReturn(tasks);

        List<Task> result = taskController.getAllTasks(null, null, "id", authentication);

        assertEquals(1, result.size());
        assertEquals("Test Task", result.get(0).getTitle());
        assertEquals("HIGH", result.get(0).getPriority());
    }

    @Test
    public void testAdminCanSeeAllTasks() {
        Task task1 = new Task();
        task1.setId(1L);
        task1.setStatus("TODO");
        task1.setPriority("LOW");
        task1.setAssignedTo("user1@test.com");
        
        Task task2 = new Task();
        task2.setId(2L);
        task2.setStatus("TODO");
        task2.setPriority("HIGH");
        task2.setAssignedTo("user2@test.com");

        when(authentication.getName()).thenReturn("admin@test.com");
        
        Collection authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        doReturn(authorities).when(authentication).getAuthorities();

        List<Task> allTasks = Arrays.asList(task1, task2);
        when(taskRepository.findAll()).thenReturn(allTasks);

        List<Task> result = taskController.getAllTasks(null, null, "id", authentication);

        assertEquals(2, result.size());
    }
}