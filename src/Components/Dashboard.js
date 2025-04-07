import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Toolbar,
  Avatar,
  AppBar,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  People as PeopleIcon,
  Work as WorkIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '' },
    { text: 'Manage Users', icon: <PeopleIcon />, path: 'users' },
    { text: 'Manage Employees', icon: <WorkIcon />, path: 'employees' }
  ];

  const drawer = (
    <>
      <Box className="drawer-header">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <StoreIcon />
          </Avatar>
          <Typography variant="h6" noWrap component="div">
            My E-Shop
          </Typography>
        </Stack>
      </Box>
      <List component={motion.div} className="menu-list">
        {menuItems.map((item) => (
          <motion.div
            key={item.text}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ListItem
              button
              onClick={() => navigate(item.path)}
              selected={location.pathname.includes(item.path)}
              className={location.pathname.includes(item.path) ? 'selected-menu-item' : ''}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </motion.div>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" className="dashboard-header">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: 'drawer-paper'
            }}
            ModalProps={{
              keepMounted: true // Better mobile performance
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            classes={{
              paper: 'drawer-paper'
            }}
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { width: 240 }
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component={motion.main}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="main-content"
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
