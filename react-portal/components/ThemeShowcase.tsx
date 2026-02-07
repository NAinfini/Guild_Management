/**
 * Theme Showcase - Visual validation for all theme control types
 *
 * Displays every MUI control type to validate theme styling:
 * - Buttons, Icon Buttons
 * - Cards, Paper
 * - Chips
 * - Inputs, TextFields
 * - Tabs
 * - Switches, Checkboxes, Radio, Toggle Buttons
 * - Sliders, Linear Progress
 * - Tooltips, Dialogs, Menus, Popovers
 * - Table components
 * - Alerts, Snackbars
 * - Badges, Avatars
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Chip,
  TextField,
  Tabs,
  Tab,
  Switch,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Badge,
  Avatar,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import {
  Favorite,
  Settings,
  Star,
  Delete,
  Edit,
  Share,
  Notifications,
} from '@mui/icons-material';

export const ThemeShowcase: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('option1');
  const [toggleValue, setToggleValue] = useState('option1');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ p: 4, maxWidth: '1400px', margin: '0 auto' }}>
      <Typography variant="h3" sx={{ mb: 4, textAlign: 'center' }}>
        Theme Showcase
      </Typography>

      {/* BUTTONS */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Buttons" />
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
            <Button variant="contained" color="primary">
              Primary Button
            </Button>
            <Button variant="contained" color="secondary">
              Secondary Button
            </Button>
            <Button variant="outlined" color="primary">
              Outlined Button
            </Button>
            <Button variant="text" color="primary">
              Text Button
            </Button>
            <Button variant="contained" disabled>
              Disabled Button
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2}>
            <Tooltip title="Favorite">
              <IconButton color="primary">
                <Favorite />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton color="secondary">
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Star">
              <IconButton>
                <Star />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {/* CARDS & SURFACES */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Cards & Surfaces" />
        <CardContent>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
            <Card sx={{ width: 200 }}>
              <CardContent>
                <Typography variant="h6">Card Title</Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a sample card with some content to showcase the
                  theme's card styling.
                </Typography>
              </CardContent>
            </Card>

            <Paper elevation={3} sx={{ p: 2, width: 200 }}>
              <Typography variant="h6">Paper Component</Typography>
              <Typography variant="body2" color="text.secondary">
                This is a Paper component with elevation.
              </Typography>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* CHIPS */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Chips" />
        <CardContent>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip label="Default Chip" />
            <Chip label="Primary" color="primary" />
            <Chip label="Secondary" color="secondary" />
            <Chip label="Clickable" color="primary" onClick={() => {}} />
            <Chip label="Deletable" color="secondary" onDelete={() => {}} />
            <Chip label="With Icon" icon={<Star />} color="primary" />
            <Chip
              label="With Avatar"
              avatar={<Avatar>A</Avatar>}
              color="secondary"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* INPUTS */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Inputs & Text Fields" />
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Standard Input" variant="outlined" />
            <TextField
              label="With Helper Text"
              helperText="This is helper text"
              variant="outlined"
            />
            <TextField
              label="Error State"
              error
              helperText="This field has an error"
              variant="outlined"
            />
            <TextField
              label="Multiline"
              multiline
              rows={3}
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* TABS */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Tabs" />
        <CardContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Tab One" />
            <Tab label="Tab Two" />
            <Tab label="Tab Three" />
            <Tab label="Tab Four" />
          </Tabs>
          <Box sx={{ p: 2, border: '1px solid var(--divider)', mt: 2 }}>
            <Typography>Content for Tab {tabValue + 1}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* SWITCHES, CHECKBOXES, RADIO, TOGGLES */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Selection Controls" />
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Switches
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={switchChecked}
                    onChange={(e) => setSwitchChecked(e.target.checked)}
                  />
                }
                label="Switch Control"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Checked Switch"
              />
              <FormControlLabel control={<Switch disabled />} label="Disabled" />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Checkboxes
              </Typography>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Checked Checkbox"
              />
              <FormControlLabel control={<Checkbox />} label="Unchecked" />
              <FormControlLabel
                control={<Checkbox disabled />}
                label="Disabled"
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Radio Buttons
              </Typography>
              <RadioGroup value={radioValue} onChange={(e) => setRadioValue(e.target.value)}>
                <FormControlLabel
                  value="option1"
                  control={<Radio />}
                  label="Option 1"
                />
                <FormControlLabel
                  value="option2"
                  control={<Radio />}
                  label="Option 2"
                />
                <FormControlLabel
                  value="option3"
                  control={<Radio />}
                  label="Option 3"
                />
              </RadioGroup>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Toggle Buttons
              </Typography>
              <ToggleButtonGroup
                value={toggleValue}
                exclusive
                onChange={(_, v) => v && setToggleValue(v)}
              >
                <ToggleButton value="option1">Option 1</ToggleButton>
                <ToggleButton value="option2">Option 2</ToggleButton>
                <ToggleButton value="option3">Option 3</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* SLIDERS & PROGRESS */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Sliders & Progress" />
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Slider
              </Typography>
              <Slider
                value={sliderValue}
                onChange={(_, v) => setSliderValue(v as number)}
                valueLabelDisplay="auto"
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Linear Progress
              </Typography>
              <LinearProgress variant="determinate" value={sliderValue} />
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* DIALOGS & MENUS */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Dialogs & Menus" />
        <CardContent>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              Open Dialog
            </Button>
            <Button
              variant="contained"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              Open Menu
            </Button>
          </Stack>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogContent>
              <Typography>
                This is a sample dialog to showcase the theme's dialog styling.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={() => setDialogOpen(false)}>
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <Edit sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <Share sx={{ mr: 1 }} /> Share
            </MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              <Delete sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Table" />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Item One</TableCell>
                <TableCell>
                  <Chip label="Active" color="primary" size="small" />
                </TableCell>
                <TableCell align="right">100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Item Two</TableCell>
                <TableCell>
                  <Chip label="Pending" color="secondary" size="small" />
                </TableCell>
                <TableCell align="right">250</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Item Three</TableCell>
                <TableCell>
                  <Chip label="Inactive" size="small" />
                </TableCell>
                <TableCell align="right">75</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ALERTS, BADGES, AVATARS */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Alerts, Badges, Avatars" />
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="success">This is a success alert!</Alert>
            <Alert severity="info">This is an info alert!</Alert>
            <Alert severity="warning">This is a warning alert!</Alert>
            <Alert severity="error">This is an error alert!</Alert>

            <Divider />

            <Stack direction="row" spacing={2}>
              <Badge badgeContent={4} color="primary">
                <Notifications />
              </Badge>
              <Badge badgeContent={99} color="secondary">
                <Notifications />
              </Badge>
              <Badge variant="dot" color="error">
                <Notifications />
              </Badge>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2}>
              <Avatar>A</Avatar>
              <Avatar sx={{ bgcolor: 'var(--accent0)' }}>B</Avatar>
              <Avatar sx={{ bgcolor: 'var(--accent1)' }}>C</Avatar>
              <Avatar alt="User" src="https://i.pravatar.cc/150?img=1" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
